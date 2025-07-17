import express from 'express';
import {
    createVenue,
    getAllVenues,
    getVenueById,
    updateVenue,
    deleteVenue,
    addVisitorToVenue,
    removeVisitorFromVenue,
    getVenueVisitors,
} from '../controllers/venue.controller';

const router = express.Router();

router.post('/venue', createVenue);
router.get('/venues', getAllVenues);
router.get('/venue/:venue_id', getVenueById);
router.put('/venue/:venue_id', updateVenue);
router.delete('/venue/:venue_id', deleteVenue);
router.post('/venue/:venue_id/visitors', addVisitorToVenue);
router.delete('/venue/:venue_id/visitors', removeVisitorFromVenue);
router.get('/venue/:venue_id/visitors', getVenueVisitors);

export default router;