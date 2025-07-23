let mapa;
let directionsService;
let directionsRenderer;
let autocompleteOrigen;
let autocompleteDestino;

function inicializarMapa() {
  mapa = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -32.9468, lng: -60.6393 }, // Rosario
    zoom: 13,
    disableDefaultUI: true,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
  directionsRenderer.setMap(mapa);

  // Autocompletado
  const origenInput = document.getElementById("origen");
  const destinoInput = document.getElementById("destino");

  autocompleteOrigen = new google.maps.places.Autocomplete(origenInput, {
    componentRestrictions: { country: "ar" }
  });

  autocompleteDestino = new google.maps.places.Autocomplete(destinoInput, {
    componentRestrictions: { country: "ar" }
  });
}

function calcularViaje() {
  const origen = document.getElementById("origen").value;
  const destino = document.getElementById("destino").value;
  const resultadoDiv = document.getElementById("resultado");

  if (!origen || !destino) {
    resultadoDiv.innerHTML = "Completá ambos campos.";
    return;
  }

  const request = {
    origin: origen,
    destination: destino,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(response);
      const distanciaMetros = response.routes[0].legs[0].distance.value;
      const costo = calcularCosto(distanciaMetros);
      resultadoDiv.innerHTML = `
        <div class="p-2 bg-light rounded">
          <p><strong>Distancia:</strong> ${(distanciaMetros / 1000).toFixed(2)} km</p>
          <p><strong>Costo estimado:</strong> $${costo}</p>
        </div>
      `;
    } else {
      resultadoDiv.innerHTML = "No se pudo calcular la ruta.";
    }
  });
}

function calcularCosto(distanciaMetros) {
  const bandera = 1200;
  const tramos = Math.ceil(distanciaMetros / 100);
  return bandera + tramos * 90;
}

function usarMiUbicacion() {
  if (!navigator.geolocation) {
    alert("La geolocalización no es soportada por tu navegador.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (posicion) => {
    const lat = posicion.coords.latitude;
    const lng = posicion.coords.longitude;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD7pxyb8oD2Y3JLLG6XsFPwpbpUcYKM_vM`
      );
      const data = await response.json();

      if (data.status === "OK") {
        const direccion = data.results[0].formatted_address;
        document.getElementById("origen").value = direccion;
      } else {
        alert("No se pudo obtener la dirección actual.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al obtener ubicación.");
    }
  }, () => {
    alert("No se pudo obtener tu ubicación. Verificá permisos del navegador.");
  });
}
