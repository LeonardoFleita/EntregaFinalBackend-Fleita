// Mostrar u ocultar el campo name

function toggleNameField() {
  const typeSelect = document.getElementById("type");
  const nameField = document.getElementById("name");
  const nameContainer = document.getElementById("nameContainer");

  if (typeSelect.value === "other" || typeSelect.value === "product") {
    nameContainer.style.display = "block";
  } else {
    nameContainer.style.display = "none";
    nameField.value = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleNameField();
});

//Cargar archivos

const documentsForm = document.getElementById("documentsForm");
const userId = documentsForm.getAttribute("data-userId");

documentsForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  upload();
});

function upload() {
  const formData = new FormData(documentsForm);
  fetch(`/api/users/${userId}/documents`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        Swal.fire({
          title: "Archivo cargado exitosamente",
          icon: "success",
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
      }
    })
    .catch((err) => console.error(err));
}
