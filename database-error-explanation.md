# Understanding the ENOTFOUND Database Error

You are encountering the following error in your Vercel logs:
`Error: getaddrinfo ENOTFOUND mysql-1992fd50-uepbooking.h.aivencloud.com`

This is a **DNS Resolution Error**. It means that your Node.js backend on Vercel is trying to connect to your Aiven Database, but the internet literally cannot find a server with the exact name: `mysql-1992fd50-uepbooking.h.aivencloud.com`.

### Why does this happen?

There are only three possible reasons for an `ENOTFOUND` error when connecting to a Cloud Database:

1. **Typo in the Hostname:** The most common cause. When you copy/pasted your `DB_HOST` into Vercel's Environment Variables, you might have:
   - Left out a letter.
   - Accidentally added a space at the beginning or end of the string.
   - Copied a slightly incorrect URL from your Aiven dashboard.

2. **The Database is Paused or Deleted:** If you are using a free tier on Aiven or another cloud provider, they sometimes automatically pause or spin down inactive databases to save resources. If the database is offline, its DNS address temporarily doesn't exist.

3. **Wrong Port Configuration:** Though less likely to cause `ENOTFOUND` specifically (usually it causes `ECONNREFUSED`), if your Vercel environment variables do not have `DB_PORT` correctly injected as `10515` (Aiven's specific MySQL port instead of the default 3306), the connection URL strings can sometimes compile incorrectly.

### How to Fix It

1. Log in to your **Aiven Console**.
2. Locate the **Host** connection string (it should look very similar to `mysql-1992fd50-[...].aivencloud.com`).
3. Copy it *very carefully*, ensuring no extra spaces are captured.
4. Log in to your **Vercel Dashboard** -> Click your **Backend Project (`uepbackend`)** -> **Settings** -> **Environment Variables**.
5. Edit the `DB_HOST` variable and paste the exact copied string.
6. Make sure `DB_PORT` is set correctly to the port Aiven provided (usually `10515`, not `3306`).
7. Go to your **Deployments** tab and hit **Redeploy**.

The Vercel Serverless Function will now be able to resolve the correct address and successfully log you in!
