const FacilityRepository = require('../repositories/facilityRepository');

class FacilityService {
    static async getAll() {
        return FacilityRepository.findAll();
    }

    static async getById(id) {
        return FacilityRepository.findById(id);
    }

    static async create(data) {
        return FacilityRepository.create(data);
    }

    static async update(id, data) {
        return FacilityRepository.update(id, data);
    }

    static async delete(id) {
        return FacilityRepository.delete(id);
    }

    // --- Facility Albums (Folders) and Images ---

    static async createAlbum(facilityId, name) {
        return FacilityRepository.createAlbum(facilityId, name);
    }

    static async deleteAlbum(albumId) {
        return FacilityRepository.deleteAlbum(albumId);
    }

    static async addImageToAlbum(albumId, imagePath) {
        return FacilityRepository.addImageToAlbum(albumId, imagePath);
    }

    static async deleteImage(imageId) {
        return FacilityRepository.deleteImage(imageId);
    }
}

module.exports = FacilityService;
