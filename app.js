function uuid() {
    return Math.random().toString(36).substring(2, 10);
}

function generarAsignaciones(lista) {
    let receptores = [...lista];
    let valido = false;

    while (!valido) {
        receptores.sort(() => Math.random() - 0.5);
        valido = true;

        for (let i = 0; i < lista.length; i++) {
            if (lista[i] === receptores[i]) {
                valido = false;
                break;
            }
        }
    }
    return receptores;
}

if (document.getElementById("generateBtn")) {

    document.getElementById("generateBtn").addEventListener("click", () => {

        let names = document.getElementById("names").value
            .split("\n")
            .map(n => n.trim())
            .filter(n => n.length > 0);

        let budget = document.getElementById("budget").value.trim();

        if (names.length < 2) {
            alert("Debes introducir al menos 2 participantes.");
            return;
        }

        if (!budget) {
            alert("Indica un presupuesto máximo.");
            return;
        }

        let receptores = generarAsignaciones(names);

        let sorteo = {};
        names.forEach((persona, i) => {
            let id = uuid();
            sorteo[id] = {
                nombre: persona,
                asignado: receptores[i],
                presupuesto: budget
            };
        });

        localStorage.setItem("amigoInvisible", JSON.stringify(sorteo));

        let table = document.getElementById("linksTable");
        table.innerHTML = "";
        document.getElementById("results").classList.remove("hidden");

        Object.keys(sorteo).forEach(id => {
            let fila = document.createElement("tr");

            let url = "ver.html?id=" + id;

            fila.innerHTML = `
                <td>${sorteo[id].nombre}</td>
                <td><a href="${url}" target="_blank">${url}</a></td>
                <td><button class="copyBtn" onclick="navigator.clipboard.writeText(window.location.origin + '/' + '${url}')">Copiar</button></td>
            `;

            table.appendChild(fila);
        });

    });
}

if (window.location.pathname.includes("ver.html")) {
    let params = new URLSearchParams(window.location.search);
    let id = params.get("id");

    let sorteo = JSON.parse(localStorage.getItem("amigoInvisible") || "{}");
    let area = document.getElementById("viewArea");

    if (!sorteo[id]) {
        area.innerHTML = `
            <h2>⚠️ Enlace no válido</h2>
            <p>Este sorteo no existe en tu navegador o el enlace no es correcto.</p>
        `;
    } else {
        let datos = sorteo[id];

        area.innerHTML = `
            <h2>Hola, ${datos.nombre} 👋</h2>
            <p>Te ha tocado regalar a:</p>
            <div class="big-name">${datos.asignado} 🎁</div>
            <p><b>Presupuesto máximo:</b> ${datos.presupuesto} €</p>
        `;
    }
}
