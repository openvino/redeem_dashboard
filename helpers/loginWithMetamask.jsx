 const loginWithMetamask = async () => {
    setIsLoading(true);
    if (typeof window.ethereum !== "undefined") {

      try {
        // Solicitar al usuario que apruebe la conexión y acceda a su cuenta de Metamask
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        // Obtener la dirección de Ethereum del usuario y cualquier otra información necesaria
        // Realizar acciones adicionales según sea necesario, como enviar la dirección a un servidor para autenticar al usuario
         dispatch(loginApp(accounts[0]))

        // Establecer el estado de inicio de sesión como verdadero
        // setLoggedIn(true);
      } catch (error) {
        console.error(error);
        // Manejar errores de inicio de sesión
        //    setError('No se puedo completar la autenticacion')
        {/* TODO  ALERTAS EN INGLES*/}

        dispatch(
          showAlert("No se puedo completar la autenticacion intente nuevamente")
        );
      } finally {
        setIsLoading(false);

        setTimeout(() => {
          dispatch(closeAlert());
        }, 3000);
      }
    } else {
      {/* TODO  ALERTAS EN INGLES*/}
      dispatch(
        showAlert(
          "Metamask no está instalado o no se detectó el proveedor de Ethereum"
        )
      );
    }
  };