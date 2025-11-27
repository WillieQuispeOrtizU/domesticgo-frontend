import { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = authService.getToken()

  // Detectar si la petición es para la API de Gemini
  const isGeminiApi = req.url.includes('generativelanguage.googleapis.com');

  // Solo adjuntar el token si existe Y NO es una petición a Gemini
  if (token && !isGeminiApi) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    })
    return next(authReq)
  }

  return next(req)
}
