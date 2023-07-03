// Utilidades para guardar PouchDB
// Creacion de BD 

const db = new PouchDB('mensajes');

//Posteo OFFLINE
function guardarMensaje( mensaje ) {
    mensaje._id = new Date().toISOString();

    return db.put( mensaje ).then( () => { // Se registra en la base local

        self.registration.sync.register('nuevo-post'); // Se postea la peticion pendiente cuando exista conexion

        // Crear respuesta ficticia al SW
        const newResp = { ok: true, offline: true };

        return new Response( JSON.stringify( newResp ) );

    });

}


// Postear mensajes a la API
function postearMensajes() {

    const posteos = [];

    return db.allDocs({ include_docs: true}).then( docs => {

        docs.rows.forEach( row => { // Coleccion de posteos pendientes

            const doc = row.doc;

            const fetchProm = fetch('api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( doc )
            }).then( res => {
                
                return db.remove( doc ); // Borrar la linea del posteo de la BD local
            });

            posteos.push( fetchProm );

        }); // Fin del forEach

        return Promise.all( posteos );
    });
    
}