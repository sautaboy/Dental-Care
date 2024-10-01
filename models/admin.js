const clinicAdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
    createdAt: { type: Date, default: Date.now }
});

const ClinicAdmin = mongoose.model('ClinicAdmin', clinicAdminSchema);
