//Logout

let logout = document.getElementById("logout");
if (logout !== null) {
  logout.addEventListener("click", function (evt) {
    evt.preventDefault();
    fetch(`/api/sessions/logout`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then(() => {
        window.location.href = "/";
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
