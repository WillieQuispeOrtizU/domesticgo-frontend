import { Usuario } from "./usuario"
import { Ubicacion } from "./ubicacion"

export interface Contrato {
  idContrato: number
  fechaInicio: Date
  estadoContrato:string
  fechaFinal: Date
  archivo: string
  descripcionContrato: string
  contratante: Usuario
  contratado: Usuario
  ubicacion: Ubicacion
}
