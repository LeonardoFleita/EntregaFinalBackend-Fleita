//Login

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  login();
});

function login() {
  const formData = new FormData(loginForm);

  const formDataJSON = {};
  formData.forEach((value, key) => {
    formDataJSON[key] = value;
  });

  fetch(`/api/sessions/login`, {
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
        window.location.href = `/`;
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
        throw new Error(res.error);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
