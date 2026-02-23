import Swal from 'sweetalert2'

export const alertSuccess = (message) => {
  return Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: message,
    timer: 2000,
    showConfirmButton: false,
  })
}

export const alertError = (message) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
  })
}

export const alertConfirm = async (message) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Confirmación',
    text: message,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  })

  return result.isConfirmed
}

export const alertSuccessFast = (mensaje) => {
  Swal.fire({
    icon: 'success',
    title: mensaje,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1300,
    timerProgressBar: true,
  })
}
