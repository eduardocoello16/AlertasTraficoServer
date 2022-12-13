import mongoose from 'mongoose';

const alertasSchema = mongoose.Schema(
    {
        id: {
            type: String, 
            require: true
        },
        alerta: {
            type: String, 
            require: true
        },
        id_mensaje:{
            type: String
        },
        id_usuario: {
            type: String,
            require: true,
        },
        tipo_alerta:{
            type: String
        },
        estado_alerta: {
            type: String,
            enum: ['pending','activa','denegada', 'eliminada'],
			default: 'pending'
        },
        latitude: {
            type: String
        },
        longitud: {
            type: String
        },
        id_mensaje_adminchat:{
            type: String
        },
        id_adminchat:{
            type: String
        },
        
        fecha_creacion: {
            type: Date,
			default: Date.now
        }
    }
)

export default mongoose.model('alerta', alertasSchema);