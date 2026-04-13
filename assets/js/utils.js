// assets/js/utils.js

// No uses 'const', simplemente usa el objeto que ya vive en window
window.Assets = {
    images: {},
    isLoaded: false,

    loadImages: function(imageSources, callback) {
        let loadedCount = 0;
        let keys = Object.keys(imageSources);
        let totalCount = keys.length;

        if (totalCount === 0) {
            this.isLoaded = true; // Importante marcarlo como listo
            callback();
            return;
        }

        keys.forEach(key => {
            let img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalCount) {
                    window.Assets.isLoaded = true; // Marcamos éxito total
                    callback();
                }
            };
            img.onerror = () => {
                console.error(`ERROR 404: No se encontró la imagen en: ${imageSources[key]}`);
                loadedCount++;
                if (loadedCount === totalCount) callback();
            };
            img.src = imageSources[key];
            this.images[key] = img; // Se guardan en window.Assets.images
        });
    }
};