"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });

    function crearTramite(agent) {
      let DNI = agent.parameters["DNI"];
      let Nombres = agent.parameters["Nombres"];
      let Apellidos = agent.parameters["Apellidos"];
      let Archivo = agent.parameters["Archivo"];
      let NroSeguimiento = Date.now();
      let Estado = "PENDIENTE";
      axios.post(
        "https://sheet.best/api/sheets/40f72ec2-a709-4e90-bac5-be276b0e0e30",
        { NroSeguimiento, DNI, Nombres, Apellidos, Archivo, Estado }
      );
      agent.add(
        "Tu trámite fue registrado correctamente. \nTu número de seguimiento es: \n✅ " +
          NroSeguimiento
      );
    }

    async function consultarTramite(agent) {
      let NroSeguimiento = agent.parameters["NroSeguimiento"];
      let respuesta = await axios.get(
        "https://sheet.best/api/sheets/40f72ec2-a709-4e90-bac5-be276b0e0e30/NroSeguimiento/" +
          NroSeguimiento
      );
      let tramites = respuesta.data;
      if (tramites.length > 0) {
        let tramite = tramites[0];
        agent.add("El estado del trámite: " + tramite.Estado);
      } else {
        agent.add("El número de seguimiento proporcionado no existe");
      }
    }

    let intentMap = new Map();
    intentMap.set("Tramites.crear", crearTramite);
    intentMap.set("Tramites.consultar", consultarTramite);

    agent.handleRequest(intentMap);
  }
);
