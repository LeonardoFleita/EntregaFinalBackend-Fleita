//Register

const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (event) {
  event.preventDefault();
  register();
});

function register() {
  const formData = new FormData(registerForm);

  const formDataJSON = {};
  formData.forEach((value, key) => {
    formDataJSON[key] = value;
  });

  fetch(`/api/sessions/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formDataJSON),
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if (res.status === "success") {
        window.location.href = `/login`;
      } else {
        console.error("Error:", res.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
