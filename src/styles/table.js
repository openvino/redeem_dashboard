export const scrollStyle = `
     .custom-scroll {
        scrollbar-width: thin; /* Para Firefox */
        scrollbar-color: #888 transparent; /* Para Firefox */
      }
      .custom-scroll::-webkit-scrollbar {
        height: 8px; /* Altura del scroll horizontal */
      }
      .custom-scroll::-webkit-scrollbar-track {
        background: transparent; /* Fondo del track */
      }
      .custom-scroll::-webkit-scrollbar-thumb {
        background-color: #888; /* Color del scroll */
        border-radius: 10px; /* Bordes redondeados */
      }
      .custom-scroll::-webkit-scrollbar-thumb:hover {
        background-color: #555; /* Color del scroll al pasar el mouse */
      }
      .scroll-container {
        position: relative;
      }
      .scroll-bar {
        position: fixed;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        overflow-x: scroll;
      }
      .scroll-bar > div {
        min-width: 200%; /* Asegúrate de que el contenido sea lo suficientemente ancho como para habilitar el desplazamiento */
      }
    `;
