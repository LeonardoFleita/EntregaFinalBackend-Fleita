//Restaurar contraseña

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

forgotPasswordForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  sendEmail();
});

function sendEmail() {
  const formData = new FormData(forgotPasswordForm);
  const formDataJSON = {};
  formData.forEach((value, key) => {
    formDataJSON[key] = value;
  });

  fetch(`/api/sessions/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataJSON),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        window.location.href = "/";
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
