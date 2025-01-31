document.addEventListener("DOMContentLoaded", () => {
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSXRSqnPwghUrq7uAef4E_48Cl_JwrbFujw90vRZCuLVMnUb9U8oy0uIRKbzGAloOQ15N6qysYw_iA2/pub?gid=0&single=true&output=csv"; // Reemplaza con tu URL

  fetch(csvUrl)
      .then(response => response.text())
      .then(csvText => {
          const parsedData = Papa.parse(csvText, { header: true }).data;
          truckData = transformCSVToData(parsedData);
          populateCards();
      })
      .catch(error => console.error("Error al cargar el CSV desde Google Sheets:", error));
});

let truckData = [];

// Función para transformar los datos del CSV en una estructura organizada
function transformCSVToData(parsedData) {
  let trucks = {};

  parsedData.forEach(row => {
      const { id, title, src, marca, modelo, disponibilidad } = row;

      if (!trucks[id]) {
          trucks[id] = {
              id: id,
              title: title,
              images: []
          };
      }

      trucks[id].images.push({
          src: src,
          marca: marca,
          modelo: modelo,
          disponibilidad: disponibilidad
      });
  });

  return Object.values(trucks);
}

// Función para generar las tarjetas dinámicamente
function populateCards() {
  const cardsContainer = document.getElementById("cardsContainer");
  cardsContainer.innerHTML = ""; // Limpiar antes de cargar nuevas tarjetas

  truckData.forEach(truck => {
      const card = createCard(truck);
      cardsContainer.appendChild(card);
  });
}

// Función para crear una tarjeta con carrusel
function createCard(truck) {
  const card = document.createElement("div");
  card.classList.add("col-12", "col-md-4", "mb-4");

  card.innerHTML = `
      <div class="card text-center">
          <div id="${truck.id}" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                  ${truck.images
                      .map((img, index) => `
                      <div class="carousel-item ${index === 0 ? "active" : ""}">
                          <img src="${img.src}" class="d-block w-100" alt="assets/img/Unidades/${truck.title}" data-index="${index}">
                      </div>
                  `)
                      .join("")}
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#${truck.id}" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${truck.id}" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
              </button>
          </div>
          <div class="card-body">
              <h5 class="card-title mv-blue">${truck.title}</h5>
              <button type="button" class="btn btn-danger" data-truck-id="${truck.id}" data-bs-toggle="offcanvas" data-bs-target="#MostrarUnidad">UNIDADES DISPONIBLES</button>
          </div>
      </div>
  `;

  return card;
}

// Función para mostrar detalles en el offcanvas
function showOffcanvas(event) {
  const button = event.target;
  const truckId = button.getAttribute("data-truck-id");

  const carousel = document.getElementById(truckId);
  const activeImage = carousel.querySelector(".carousel-item.active img");
  const activeIndex = activeImage.getAttribute("data-index");

  const truckDetails = truckData.find(truck => truck.id === truckId);
  const imageDetails = truckDetails.images[activeIndex];

  document.getElementById("offcanvasImage").src = imageDetails.src;
  document.getElementById("offcanvasImage").alt = `${imageDetails.marca} ${imageDetails.modelo}`;

  document.getElementById("offcanvasDetails").innerHTML = `
      <p class="txt-marva contactos"><strong>Marca:</strong> ${imageDetails.marca}</p>
      <p class="txt-marva contactos"><strong>Modelo:</strong> ${imageDetails.modelo}</p>
      <p class="txt-marva contactos"><strong>Disponibilidad:</strong> ${imageDetails.disponibilidad}</p>
  `;
}

document.addEventListener("click", event => {
  if (event.target.matches(".btn-danger")) {
      showOffcanvas(event);
  }
});
