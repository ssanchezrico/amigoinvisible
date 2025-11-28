// Generate assignment avoiding self pairing
function generarAsignaciones(lista) {
    let receptores = [...lista];
    let valido = false;

    while (!valido) {
        receptores.sort(() => Math.random() - 0.5);
        valido = true;
        for (let i = 0; i < lista.length; i++) {
            if (lista[i] === receptores[i]) valido = false;
        }
    }
    return receptores;
}

if (document.getElementById("generateBtn")) {

    document.getElementById("generateBtn").addEventListener("click", () => {

        let lines = document.getElementById("names").value
            .split("\n")
            .map(n => n.trim())
            .filter(n => n.length > 0);

        let budget = document.getElementById("budget").value.trim();

        if (lines.length < 2) {
            alert("Debes introducir al menos 2 participantes.");
            return;
        }

        if (!budget) {
            alert("Indica un presupuesto máximo.");
            return;
        }

        let names = lines.map(l => l.split(";")[0].trim());
        let emails = lines.map(l => (l.split(";")[1] || "").trim());

        let receptores = generarAsignaciones(names);

        let table = document.getElementById("linksTable");
        table.innerHTML = "";
        document.getElementById("results").classList.remove("hidden");

        names.forEach((persona, i) => {

            let email = emails[i];

            let payload = {
                nombre: persona,
                asignado: receptores[i],
                presupuesto: budget
            };

            let token = encodeURIComponent(btoa(JSON.stringify(payload)));
            let relativeUrl = "ver.html?d=" + token;
            let fullUrl = new URL(relativeUrl, window.location.href).href;

            let fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${persona}</td>
                <td>${email}</td>
                <td><a href="${fullUrl}" target="_blank">Ver enlace</a></td>
                <td><button class="copyBtn">Copiar</button></td>
                <td><button class="sendBtn">Enviar correo</button></td>
            `;

            fila.querySelector(".copyBtn").addEventListener("click", () => {
                navigator.clipboard.writeText(fullUrl);
                alert("Enlace copiado");
            });

            fila.querySelector(".sendBtn").addEventListener("click", () => {

                if (!email) {
                    alert("No hay email para esta persona");
                    return;
                }

                emailjs.send("service_mu9mcgc", "template_dygk1xg", {
                    to_name: persona,
		    to_email: email,
                    secret_link: fullUrl
                }).then(() => {
                    alert("Correo enviado a " + persona);
                }).catch((err) => {
                    alert("Error enviando el correo");
                    console.error(err);
                });

            });

            table.appendChild(fila);
        });

    });
}

// ver.html
if (window.location.pathname.includes("ver.html")) {
    let params = new URLSearchParams(window.location.search);
    let d = params.get("d");
    let area = document.getElementById("viewArea");

    if (!d) {
        area.innerHTML = `
            <h2>⚠️ Enlace no válido</h2>
            <p>No se han encontrado datos en este enlace.</p>
        `;
    }

    try {
        let json = atob(decodeURIComponent(d));
        let datos = JSON.parse(json);

        area.innerHTML = `
            <h2>Hola, ${datos.nombre} 👋</h2>
            <p>Te ha tocado regalar a:</p>
            <div class="big-name">${datos.asignado} 🎁</div>
            <p><b>Presupuesto máximo:</b> ${datos.presupuesto} €</p>
        `;
    } catch (e) {
        area.innerHTML = `
            <h2>⚠️ Enlace no válido</h2>
            <p>Ha ocurrido un problema al leer los datos del sorteo.</p>
        `;
    }
}
