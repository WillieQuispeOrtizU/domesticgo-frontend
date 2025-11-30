import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { MatCardModule } from "@angular/material/card"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatSelectModule } from "@angular/material/select"
import { MatButtonModule } from "@angular/material/button"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatIconModule } from "@angular/material/icon"
import { MatDatepickerModule } from "@angular/material/datepicker"
import { MatNativeDateModule } from "@angular/material/core"
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"

import { Usuario } from "../../models/usuario"
import { Empleo } from "../../models/empleo"
import { UsuarioService } from "../../services/usuario.service"
import { EmpleoService } from "../../services/empleo.service"

@Component({
  selector: "app-usuario-crear-editar",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: "./usuario-crear-editar.component.html",
  styleUrls: ["./usuario-crear-editar.component.css"],
})
export class UsuarioCrearEditarComponent implements OnInit {
  usuarioForm!: FormGroup
  empleos: Empleo[] = []
  isEditing = false
  usuarioId: number | null = null
  loading = false

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private empleoService: EmpleoService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.cargarEmpleos()

    const id = this.route.snapshot.paramMap.get("id")
    if (id) {
      this.isEditing = true
      this.usuarioId = +id
      this.cargarUsuario(this.usuarioId)
    }
  }

  initForm(): void {
    this.usuarioForm = this.formBuilder.group({
      nombres: ["", [Validators.required, Validators.maxLength(100)]],
      apellidoPaterno: ["", [Validators.maxLength(50)]],
      apellidoMaterno: ["", [Validators.maxLength(50)]],
      email: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],

      // Nuevos campos
      tipoDocumento: ["DNI", [Validators.required]],
      numeroDocumento: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      numeroCelular: ["", [Validators.required, Validators.minLength(9)]],
      fechaNacimiento: ["", [Validators.required]],

      empleo: ["", [Validators.required]],
    })
  }

  cargarEmpleos(): void {
    this.empleoService.listar().subscribe({
      next: (data) => (this.empleos = data),
      error: () => this.snackBar.open("Error al cargar empleos", "Cerrar", { duration: 3000 }),
    })
  }

  cargarUsuario(id: number): void {
    this.usuarioService.buscarPorId(id).subscribe({
      next: (usuario) => {
        this.usuarioForm.patchValue({
          nombres: usuario.nombres,
          apellidoPaterno: usuario.apellidoPaterno,
          apellidoMaterno: usuario.apellidoMaterno,
          email: usuario.email,
          tipoDocumento: usuario.tipoDocumento,
          numeroDocumento: usuario.numeroDocumento,
          numeroCelular: usuario.numeroCelular,
          fechaNacimiento: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento as string) : null,

          empleo: usuario.empleo?.idEmpleo,
        })
      },
      error: () => this.snackBar.open("Error al cargar usuario", "Cerrar", { duration: 3000 }),
    })
  }

  onSubmit(): void {
    if (this.usuarioForm.valid) {
      this.loading = true
      const formData = this.usuarioForm.value

      const formatearFecha = (fecha: any): string => {
        if (!fecha) return '';
        return new Date(fecha).toISOString().split('T')[0];
      };

      const usuario: Usuario = {
        idUsuario: this.usuarioId || 0,
        nombres: formData.nombres,
        apellidoPaterno: formData.apellidoPaterno,
        apellidoMaterno: formData.apellidoMaterno,
        email: formData.email,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        numeroCelular: formData.numeroCelular,
        fechaNacimiento: formatearFecha(formData.fechaNacimiento),

        empleo: this.empleos.find((e) => e.idEmpleo === formData.empleo)!,
      }

      const operation = this.isEditing
        ? this.usuarioService.modificar(usuario)
        : this.usuarioService.registrar(usuario)

      operation.subscribe({
        next: () => {
          this.snackBar.open(`Usuario ${this.isEditing ? "actualizado" : "creado"} correctamente`, "Cerrar", { duration: 3000 })
          this.router.navigate(["/usuarios"])
        },
        error: () => {
          this.snackBar.open("Error al guardar usuario", "Cerrar", { duration: 3000 })
          this.loading = false
        },
      })
    }
  }

  volver(): void {
    this.router.navigate(["/usuarios"])
  }
}
