// Objeto global para almacenar nuestras imágenes cargadas
const Assets = {
    images: {},

    // Función para precargar imágenes
    loadImages: function(imageSources, callback) {
        let loadedCount = 0;
        let totalCount = Object.keys(imageSources).length;

        // Si no hay imágenes para cargar, ejecuta el callback inmediatamente
        if (totalCount === 0) {
            callback();
            return;
        }

        for (let key in imageSources) {
            let img = new Image();
            img.onload = () => {
                loadedCount++;
                // Cuando todas las imágenes terminen de cargar, avisa al juego
                if (loadedCount === totalCount) {
                    callback();
                }
            };
            // Si la ruta está mal, evitamos que el juego se quede congelado
            img.onerror = () => {
                console.error(`Error cargando imagen: ${imageSources[key]}`);
                loadedCount++;
                if (loadedCount === totalCount) callback();
            };
            img.src = imageSources[key];
            this.images[key] = img;
        }
    }
};