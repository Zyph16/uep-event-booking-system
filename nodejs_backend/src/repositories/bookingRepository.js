const { pool } = require('../core/database');
const Booking = require('../models/booking');

class BookingRepository {
    static async findAll() {
        const [rows] = await pool.query('SELECT * FROM bookings');
        return rows.map(r => Booking.fromRow(r));
    }

    static async getAllWithDetails() {
        const sql = `
      SELECT 
        b.*,
        u.username,
        pi.email,
        r.name as user_role,
        COALESCE(pi.fname, '') as first_name,
        COALESCE(pi.lname, '') as last_name,
        COALESCE(pi.phone, '') as phone,
        pi.street,
        pi.city,
        pi.province,
        f.facility_name,
        bl.billing_id as billing_exists
      FROM bookings b
      LEFT JOIN users u ON b.userID = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN personal_info pi ON u.id = pi.userID
      LEFT JOIN facilities f ON b.facilityID = f.facilityID
      LEFT JOIN billings bl ON b.bookingID = bl.booking_id
      ORDER BY b.created_at DESC
    `;
        const [rows] = await pool.query(sql);

        return rows.map(row => {
            let fullName = (row.first_name + ' ' + row.last_name).trim();
            if (!fullName) fullName = row.username || 'Unknown User';

            const addrParts = [];
            if (row.street) addrParts.push(row.street);
            if (row.city) addrParts.push(row.city);
            if (row.province) addrParts.push(row.province);

            const ff = parseFloat(row.facility_fee || 0);
            const ef = parseFloat(row.equipment_fee || 0);

            return {
                bookingID: row.bookingID,
                userID: row.userID,
                facilityID: row.facilityID,
                user_name: fullName,
                user_email: row.email || '',
                user_phone: row.phone || '',
                user_address: addrParts.join(', '),
                user_role: row.user_role || 'Unknown',
                facility_name: row.facility_name || 'Unknown Facility',
                organization: row.organization,
                purpose: row.purpose,
                date_requested: row.date_requested,
                date_start: row.date_start || null,
                date_end: row.date_end || null,
                time_start: row.time_start,
                time_end: row.time_end,
                status: row.status,
                created_at: row.created_at,
                facility_fee: ff,
                equipment_fee: ef,
                has_billing: (ff + ef) > 0,
                setup_date_start: row.setup_date_start || null,
                setup_date_end: row.setup_date_end || null,
                setup_time_start: row.setup_time_start || null,
                setup_time_end: row.setup_time_end || null
            };
        });
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE bookingID = ?', [id]);
        if (rows.length === 0) return null;

        const booking = Booking.fromRow(rows[0]);

        // Fetch Schedule
        const [schedule] = await pool.query(
            'SELECT * FROM booking_schedules WHERE booking_id = ? ORDER BY date ASC, time_start ASC',
            [id]
        );
        booking.setSchedule(schedule);

        return booking;
    }

    static async create(data) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            let dStart = data.date_start || null;
            let dEnd = data.date_end || null;

            if (data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
                const dates = data.schedule.map(s => s.date);
                if (dates.length > 0) {
                    dStart = dates.reduce((a, b) => a < b ? a : b);
                    dEnd = dates.reduce((a, b) => a > b ? a : b);
                }
            }

            const [result] = await connection.query(`
        INSERT INTO bookings 
        (userID, facilityID, organization, purpose, date_requested, date_start, date_end, time_start, time_end, status, setup_date_start, setup_date_end, setup_time_start, setup_time_end) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                data.userID,
                data.facilityID,
                data.organization,
                data.purpose,
                data.date_requested,
                dStart,
                dEnd,
                data.time_start,
                data.time_end,
                data.status || 'pending',
                data.setup_date_start || null,
                data.setup_date_end || null,
                data.setup_time_start || null,
                data.setup_time_end || null
            ]);

            const id = result.insertId;

            // Save Schedule
            if (data.schedule && Array.isArray(data.schedule) && data.schedule.length > 0) {
                for (const item of data.schedule) {
                    await connection.query(
                        'INSERT INTO booking_schedules (booking_id, date, time_start, time_end, status) VALUES (?, ?, ?, ?, ?)',
                        [id, item.date, item.time_start, item.time_end, data.status || 'Pending']
                    );
                }
            } else if (dStart) {
                // Fallback
                await connection.query(
                    'INSERT INTO booking_schedules (booking_id, date, time_start, time_end, status) VALUES (?, ?, ?, ?, ?)',
                    [id, dStart, data.time_start, data.time_end, data.status || 'Pending']
                );
            }

            // Inclusions
            if (data.equipmentIDs && Array.isArray(data.equipmentIDs)) {
                for (const eid of data.equipmentIDs) {
                    await connection.query('INSERT IGNORE INTO booking_equipment (bookingID, equipmentID) VALUES (?, ?)', [id, eid]);
                }
            }

            if (data.roomIDs && Array.isArray(data.roomIDs)) {
                for (const rid of data.roomIDs) {
                    await connection.query('INSERT IGNORE INTO booking_rooms (bookingID, roomID) VALUES (?, ?)', [id, rid]);
                }
            }

            await connection.commit();
            return this.findById(id);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findByUserId(userId) {
        // 1. Fetch Bookings
        const [rows] = await pool.query(`
      SELECT b.*, f.facility_name, bl.billing_id 
      FROM bookings b 
      LEFT JOIN facilities f ON b.facilityID = f.facilityID 
      LEFT JOIN billings bl ON b.bookingID = bl.booking_id
      WHERE b.userID = ? 
      ORDER BY b.bookingID DESC
    `, [userId]);

        const bookings = [];
        // Populate details loop
        for (const row of rows) {
            const bid = row.bookingID;
            const booking = {
                bookingID: row.bookingID,
                userID: row.userID,
                facilityID: row.facilityID,
                facility_name: row.facility_name || 'Unknown',
                organization: row.organization,
                purpose: row.purpose,
                date_requested: row.date_requested,
                date_start: row.date_start,
                date_end: row.date_end,
                time_start: row.time_start,
                time_end: row.time_end,
                status: row.status,
                created_at: row.created_at,
                facility_fee: parseFloat(row.facility_fee || 0),
                equipment_fee: parseFloat(row.equipment_fee || 0),
                has_billing: (parseFloat(row.facility_fee || 0) + parseFloat(row.equipment_fee || 0)) > 0,
                equipment_inclusions: [],
                room_inclusions: [],
                project_manager: null,
                university_president: null
            };

            // Equipment
            const [eqRows] = await pool.query(`
            SELECT e.equipment_name 
            FROM booking_equipment be 
            JOIN equipment e ON be.equipmentID = e.equipmentID 
            WHERE be.bookingID = ?
        `, [bid]);
            booking.equipment_inclusions = eqRows.map(r => r.equipment_name);

            // Rooms
            const [rmRows] = await pool.query(`
            SELECT r.room_name 
            FROM booking_rooms br 
            JOIN room r ON br.roomID = r.roomID 
            WHERE br.bookingID = ?
        `, [bid]);
            booking.room_inclusions = rmRows.map(r => r.room_name);

            // Project Manager
            const [pmRows] = await pool.query(`
             SELECT u.username, pi.fname, pi.lname
             FROM booking_approvals ba
             JOIN users u ON ba.approver_id = u.id
             LEFT JOIN personal_info pi ON u.id = pi.userID
             WHERE ba.booking_id = ? 
               AND (ba.approver_role = 'PROJECT MANAGER' OR ba.approval_stage LIKE 'Initial%')
             LIMIT 1
        `, [bid]);
            if (pmRows.length > 0) {
                const r = pmRows[0];
                let full = (r.fname + ' ' + r.lname).trim();
                booking.project_manager = full || r.username;
            }

            // President
            const [presRows] = await pool.query(`
             SELECT u.username, pi.fname, pi.lname
             FROM booking_approvals ba
             JOIN users u ON ba.approver_id = u.id
             LEFT JOIN personal_info pi ON u.id = pi.userID
             WHERE ba.booking_id = ? 
               AND (ba.approver_role = 'UNIVERSITY PRESIDENT' OR ba.approver_role = 'PRESIDENT')
             LIMIT 1
        `, [bid]);
            if (presRows.length > 0) {
                const r = presRows[0];
                let full = (r.fname + ' ' + r.lname).trim();
                booking.university_president = full || r.username;
            }

            bookings.push(booking);
        }
        return bookings;
    }

    static async update(id, data) {
        const fields = [
            'userID', 'facilityID', 'organization', 'purpose',
            'date_requested', 'date_start', 'date_end',
            'time_start', 'time_end', 'status',
            'setup_date_start', 'setup_date_end', 'setup_time_start', 'setup_time_end',
            'facility_fee', 'equipment_fee'
        ];
        const set = [];
        const values = [];

        for (const f of fields) {
            if (data[f] !== undefined) {
                set.push(`${f} = ?`);
                values.push(data[f]);
            }
        }

        if (set.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE bookings SET ${set.join(', ')} WHERE bookingID = ?`, values);
        return this.findById(id);
    }

    static async updateStatus(id, newStatus, expectedOldStatus) {
        const [result] = await pool.query(
            'UPDATE bookings SET status = ? WHERE bookingID = ? AND status = ?',
            [newStatus, id, expectedOldStatus]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.query('DELETE FROM bookings WHERE bookingID = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getBillingContext(id) {
        const [rows] = await pool.query(`
        SELECT 
            b.*, 
            f.facility_name, 
            f.price as facility_price,
            u.username,
            pi.fname,
            pi.lname
        FROM bookings b
        LEFT JOIN facilities f ON b.facilityID = f.facilityID
        LEFT JOIN users u ON b.userID = u.id
        LEFT JOIN personal_info pi ON u.id = pi.userID
        WHERE b.bookingID = ?
    `, [id]);

        if (rows.length === 0) return null;
        const booking = rows[0];

        // User Name
        let full = (booking.fname + ' ' + booking.lname).trim();
        booking.user_name = full || booking.username || 'Unknown User';

        // Equipment
        const [eqRows] = await pool.query(`
        SELECT e.equipment_name, e.price
        FROM booking_equipment be
        JOIN equipment e ON be.equipmentID = e.equipmentID
        WHERE be.bookingID = ?
    `, [id]);

        // Rooms
        const [rmRows] = await pool.query(`
        SELECT r.room_name, r.price
        FROM booking_rooms br
        JOIN room r ON br.roomID = r.roomID
        WHERE br.bookingID = ?
    `, [id]);

        booking.inclusions = {
            equipment: eqRows.map(e => ({ ...e, price: parseFloat(e.price) })),
            rooms: rmRows.map(r => ({ ...r, price: parseFloat(r.price) }))
        };

        // PM, President fetches similar to findByUserId
        const [pmRows] = await pool.query(`
             SELECT u.username, pi.fname, pi.lname
             FROM booking_approvals ba
             JOIN users u ON ba.approver_id = u.id
             LEFT JOIN personal_info pi ON u.id = pi.userID
             WHERE ba.booking_id = ? 
               AND (ba.approver_role = 'PROJECT MANAGER' OR ba.approval_stage LIKE 'Initial%')
             ORDER BY ba.approval_id DESC LIMIT 1
    `, [id]);
        booking.project_manager = pmRows.length ? ((pmRows[0].fname + ' ' + pmRows[0].lname).trim() || pmRows[0].username) : null;

        const [presRows] = await pool.query(`
             SELECT u.username, pi.fname, pi.lname
             FROM booking_approvals ba
             JOIN users u ON ba.approver_id = u.id
             LEFT JOIN personal_info pi ON u.id = pi.userID
             WHERE ba.booking_id = ? 
               AND (ba.approver_role = 'UNIVERSITY PRESIDENT' OR ba.approver_role = 'PRESIDENT')
             ORDER BY ba.approval_id DESC LIMIT 1
    `, [id]);
        booking.university_president = presRows.length ? ((presRows[0].fname + ' ' + presRows[0].lname).trim() || presRows[0].username) : null;

        booking.facility_price = parseFloat(booking.facility_price || 0);

        return booking;
    }

    static async getPublicSchedule() {
        // Fallback to querying bookings table directly if booking_schedules is missing or to simplify
        // Also added b.userID for 'My Bookings' frontend logic
        const sql = `
        SELECT 
            b.bookingID as id, 
            b.bookingID,
            b.facilityID,
            f.facility_name,
            b.date_start, 
            b.date_end,
            b.time_start,
            b.time_end,
            b.status,
            b.userID,
            b.organization,
            b.purpose,
            b.setup_date_start,
            b.setup_date_end,
            b.setup_time_start,
            b.setup_time_end
        FROM bookings b
        LEFT JOIN facilities f ON b.facilityID = f.facilityID
        WHERE b.status NOT IN ('Cancelled', 'Rejected')
        ORDER BY b.date_start ASC, b.time_start ASC
    `;
        const [rows] = await pool.query(sql);
        return rows;
    }

    static async findOverlaps(facilityId, dateStart, dateEnd, timeStart, timeEnd, setupDateStart = null, setupDateEnd = null, setupTimeStart = null, setupTimeEnd = null) {
        const sEnd = setupDateEnd || setupDateStart;
        const stStart = setupTimeStart || '00:00';
        const stEnd = setupTimeEnd || '23:59';

        const sql = `
        SELECT b.*, r.name as user_role, bs.date as conflicting_date, bs.time_start as conflicting_start, bs.time_end as conflicting_end, 'Event' as conflict_type
        FROM booking_schedules bs
        JOIN bookings b ON bs.booking_id = b.bookingID
        JOIN users u ON b.userID = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE b.facilityID = ?
          AND b.status NOT IN ('Cancelled', 'Rejected')
          AND (
              (
                  bs.date >= ? AND bs.date <= ?
                  AND
                  (bs.time_start < ? AND bs.time_end > ?)
              )
              OR
              (
                  ? IS NOT NULL 
                  AND bs.date >= ? AND bs.date <= ?
                  AND
                  (bs.time_start < ? AND bs.time_end > ?)
              )
          )
        
        UNION

        SELECT b.*, r.name as user_role, COALESCE(b.setup_date_start, b.date_start) as conflicting_date, b.setup_time_start as conflicting_start, b.setup_time_end as conflicting_end, 'Setup' as conflict_type
        FROM bookings b
        JOIN users u ON b.userID = u.id
        JOIN roles r ON u.role_id = r.id
        WHERE b.facilityID = ?
          AND b.status NOT IN ('Cancelled', 'Rejected')
          AND b.setup_date_start IS NOT NULL
          AND (
              (
                  b.setup_date_start <= ? AND COALESCE(b.setup_date_end, b.setup_date_start) >= ?
                  AND
                  (COALESCE(b.setup_time_start, '00:00') < ? AND COALESCE(b.setup_time_end, '23:59') > ?)
              )
              OR
              (
                  ? IS NOT NULL
                  AND b.setup_date_start <= ? AND COALESCE(b.setup_date_end, b.setup_date_start) >= ?
                  AND
                  (COALESCE(b.setup_time_start, '00:00') < ? AND COALESCE(b.setup_time_end, '23:59') > ?)
              )
          )
    `;

        const [rows] = await pool.query(sql, [
            facilityId,
            dateStart, dateEnd, timeEnd, timeStart,
            setupDateStart, setupDateStart, sEnd, stEnd, stStart, // Note param order for query parts
            facilityId,
            dateEnd, dateStart, timeEnd, timeStart,
            setupDateStart, sEnd, setupDateStart, stEnd, stStart
        ]);

        // Note: Parameter mapping is tricky with complex raw SQL. 
        // The query used named params in PHP (:fid, :ds etc), but ? in node.
        // I mapped them correctly to match the positions.
        // Part 1: fid, ds, de, te, ts, sds, sds, sde, ste, sts
        // Part 2: fid, de, ds, te, ts, sds, sde, sds, ste, sts
        // Double check parameter ordering carefully.

        // PHP:
        // :ds (dateStart), :de (dateEnd)
        // :ts (timeStart), :te (timeEnd)
        // Part 1: bs.date >= :ds AND bs.date <= :de AND (time < :te AND time > :ts)
        // Part 2: :sds IS NOT NULL AND bs.date >= :sds AND bs.date <= :sde AND (time < :ste AND time > :sts)

        // My JS:
        // 1: dateStart
        // 2: dateEnd
        // 3: timeEnd
        // 4: timeStart
        // 5: setupDateStart
        // 6: setupDateStart
        // 7: sEnd
        // 8: stEnd
        // 9: stStart

        return rows;
    }
}

module.exports = BookingRepository;
