var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
var moment = require('moment')
var momentTZ = require('moment-timezone')
var nodemailer = require('nodemailer');
var app = express();

init = async () => {

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors())

  var transporter = nodemailer.createTransport({
    pool: true,
    service: 'smtp',
    host: "smtp-relay.sendinblue.com",
    port: 587,
    secure: false, // use TLS
    auth: {
      user: "steloerick@gmail.com",
      pass: "hYLv8UT9t5qgVI1S"
    },
  });

  conn = async () => {
    const sequelize = new Sequelize('Tarefas', 'webmaster', 'pgsql.dev', {
      host: 'localhost',
      dialect: 'postgres',
      protocol: 'tcp'
    });
    try {
      await sequelize.authenticate();
      console.log('Conexão Realizada com Sucesso.');
      var categoria = sequelize.define('categoria', {
        categ_cod: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        categ_desc: {
          type: DataTypes.STRING,
          allowNull: false

        }

      }, {
        tableName: 'categoria',
        createdAt: false,
        updatedAt: false
      })

      var tarefa = sequelize.define('tarefa', {
        tarefa_cod: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        categ_cod: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        tarefa_desc: {
          type: DataTypes.STRING,
          allowNull: false
        },
        tarefa_data: {
          type: DataTypes.STRING,
          allowNull: false
        },
        tarefa_hora: {
          type: DataTypes.STRING,
          allowNull: false
        },
        tarefa_status: {
          type: DataTypes.STRING,
          allowNull: false
        }

      }, {
        tableName: 'tarefa',
        createdAt: false,
        updatedAt: false
      })

      var email = sequelize.define('email', {
        email_cod: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        tarefa_cod: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        email_desc: {
          type: DataTypes.STRING,
          allowNull: false

        }

      }, {
        tableName: 'email',
        createdAt: false,
        updatedAt: false
      })

      categoria.hasMany(tarefa, { foreignKey: 'categ_cod', as: 'tarefas' });
      tarefa.belongsTo(categoria, { foreignKey: 'categ_cod', as: 'categoria' });

      tarefa.hasMany(email, { foreignKey: 'tarefa_cod', as: 'email' });
      email.belongsTo(tarefa, { foreignKey: 'tarefa_cod', as: 'tarefas' });

    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    return Promise.resolve({ categoria: categoria, tarefa: tarefa, email: email })
  }
  try {
    var models = await conn();

  } catch (error) {
    console.log(error);
  }

  app.use(function (req, res, next) {
    req.model = models
    next();
  });
// TAREFA FILTERS
  app.get('/tarefas', async function (req, res) {
    console.log(req.params)
    var listTarefas = await req.model.tarefa.findAll()
    res.status(200).json({ listTarefas: listTarefas })
  })

  app.get('/tarefas-cod', async function (req, res) {
    console.log(req.params)
    var listTarefas = await req.model.tarefa.findAll({ order: Sequelize.literal('tarefa_cod') })
    res.status(200).json({ listTarefas: listTarefas })
  })
  app.get('/tarefas-nome', async function (req, res) {
    console.log(req.params)
    var listTarefas = await req.model.tarefa.findAll({ order: Sequelize.literal('tarefa_desc') })
    res.status(200).json({ listTarefas: listTarefas })
  })
  // app.get('/emails-nome', async function (req, res) {
  //   console.log(req.params)
  //   var listEmails = await req.model.email.findAll({ order: Sequelize.literal('email_desc') })
  //   res.status(200).json({ listEmails: listEmails })
  // })
  app.get('/tarefas-reali', async function (req, res) {
    console.log(req.params)
    var listTarefas = await req.model.tarefa.findAll({ where: { tarefa_status: 'R' } })
    res.status(200).json({ listTarefas: listTarefas })
  })
  app.get('/tarefas-pend', async function (req, res) {
    console.log(req.params)
    var listTarefas = await req.model.tarefa.findAll({ where: { tarefa_status: 'P' } })
    res.status(200).json({ listTarefas: listTarefas })
  })
// CATEG FILTERS
  app.get('/categorias', async function (req, res) {
    console.log(req.params)
    var listCategs = await req.model.categoria.findAll()
    res.status(200).json({ listCategs: listCategs })
  })
  app.get('/categorias-cod', async function (req, res) {
    console.log(req.params)
    var listCategs = await req.model.categoria.findAll({ order: Sequelize.literal('categ_cod') })
    res.status(200).json({ listCategs: listCategs })
  })
  app.get('/categorias-nome', async function (req, res) {
    console.log(req.params)
    var listCategs = await req.model.categoria.findAll({ order: Sequelize.literal('categ_desc') })
    res.status(200).json({ listCategs: listCategs })
  })
  // EMAILS FILTERS
  app.get('/emails', async function (req, res) {
    console.log(req.params)
    var listEmails = await req.model.email.findAll()
    res.status(200).json({ listEmails: listEmails })
  })
  app.get('/emails-cod', async function (req, res) {
    console.log(req.params)
    var listEmails = await req.model.email.findAll({ order: Sequelize.literal('email_cod') })
    res.status(200).json({ listEmails: listEmails })
  })
  app.get('/emails-nome', async function (req, res) {
    console.log(req.params)
    var listEmails = await req.model.email.findAll({ order: Sequelize.literal('email_desc') })
    res.status(200).json({ listEmails: listEmails })
  })

  app.delete('/deleteTarefa/:codTarefa', async function (req, res) {
    var payload = req.params
    try {
      await req.model.tarefa.destroy({ where: { tarefa_cod: payload.codTarefa } })
      console.log('Payload Received', payload)
      res.status(200).json({})

    } catch (error) {
      console.log(error)
      res.status(500).json({})
    }
  })

  app.delete('/deleteCategoria/:codCategoria', async function (req, res) {
    var payload = req.params
    try {
      await req.model.categoria.destroy({ where: { categ_cod: payload.codCategoria } })
      console.log('Payload Received', payload)
      res.status(200).json({})

    } catch (error) {
      console.log(error)
      res.status(500).json({})
    }
  })

  app.delete('/deleteEmail/:codEmail', async function (req, res) {
    var payload = req.params
    try {
      await req.model.email.destroy({ where: { email_cod: payload.codEmail } })
      console.log('Payload Received', payload)
      res.status(200).json({})

    } catch (error) {
      console.log(error)
      res.status(500).json({})
    }
  })

  app.post('/insert', async function (req, res) {

    var payload = req.body;

    console.log(payload);

    if (Object.keys(payload)[0] == "categ_cod") {
      console.log("TAREFA")

        var dataReformada = (moment(payload.tarefa_data)).tz('America/Sao_Paulo').format('YYYY-MM-DD')
        var dataReformadaBR = (moment(payload.tarefa_data)).tz('America/Sao_Paulo').format('DD-MM-YYYY')
        var horaReformada = (moment(payload.tarefa_hora)).tz('America/Sao_Paulo').format('HH:mm:ss')
        var categoriaSelected = await req.model.categoria.findOne({ where: { categ_cod: payload.categ_cod } }) // AQUI
        await req.model.tarefa.create({
          categ_cod: payload.categ_cod,
          tarefa_desc: payload.tarefa_desc,
          tarefa_data: dataReformada,
          tarefa_hora: horaReformada,
          tarefa_status: payload.tarefa_status // OI ERICK :D
        }).then(result => {
          var emailList = payload.email_desc.split(" ")
          for (email in emailList) { req.model.email.create({
            tarefa_cod: result.tarefa_cod,
            email_desc: emailList[email]})
            if (payload.tarefa_status == 'P') {

              transporter.sendMail({
                from: 'marcelo.marella22@gmail.com',
                to: emailList[email],
                subject: 'Nova Tarefa Agendada',
                text: `
              <<div style= " position: relative; margin: 0 20%; justify-content: center; ">
          
              <h3>${payload.tarefa_desc}</h3>
              
              <h4>Categoria: <strong>${categoriaSelected.categ_desc}</strong></h4> 
              <h4>Data Agendada: <strong>${dataReformadaBR}</strong></h4>
              <h4>Hora Agendada: <strong>${horaReformada}</strong></h4>
                  <br>
              </div>
              `
            })
            
            console.log('Email Enviado para '+emailList[email])
          }
        }
        console.log(payload.tarefa_desc)
        console.log(categoriaSelected.categ_desc)
          })

        // var getCategoria = req.model.categoria.findAll({ where: { categ_cod: payload.categ_cod } })

        

    if (Object.keys(payload)[0] == "categ_desc") {
      console.log('CATEGORIA')
      try {
        await req.model.categoria.create({
          categ_cod: payload.categ_cod,
          categ_desc: payload.categ_desc
        })
      } catch (error) {
        console.log(error)
        res.status(500).json({})
      }
    }

    if (Object.keys(payload)[0] == "tarefa_cod") {
      console.log("EMAIL")
      try {
        req.model.email.create({
          tarefa_cod: payload.tarefa_cod,
          email_desc: payload.email_desc
        })
      } catch (error) {
        console.log(error)
        res.status(500).json({})
      }
    }
  }
})

  app.post('/edit', async function (req, res, next) {
    var payload = req.body
    try {

      if (Object.keys(payload)[0] == "tarefa_cod") {

        var payloadHora = new Date(payload.tarefa_hora)
        var payloadData = new Date(payload.tarefa_data)
        payload.tarefa_data = payloadData.getFullYear() + '-' + (payloadData.getMonth() + 1) + '-' + payloadData.getDate();
        console.log(payload.tarefa_data)
        payload.tarefa_hora = payloadHora.getHours() + ':' + payloadHora.getMinutes() + ':' + payloadHora.getSeconds();

        try {
          await req.model.tarefa.update(payload, { where: { tarefa_cod: payload.tarefa_cod } })
          res.status(200).json({})
        } catch (error) {
          console.log(error)
          res.status(500).json({})
        }
      }
      else if (Object.keys(payload)[0] == "categ_cod") {

        try {
          await req.model.categoria.update(payload, { where: { categ_cod: payload.categ_cod } })
          res.status(200).json({})
        } catch (error) {
          console.log(error)
          res.status(500).json({})
        }
      }

      else if (Object.keys(payload)[0] == "email_cod") {

        try {
          await req.model.email.update(payload, { where: { email_cod: payload.email_cod } })
          res.status(200).json({})
        } catch (error) {
          console.log(error)
          res.status(500).json({})
        }
      }

    } catch (error) {
      console.log(error)
      console.log("If Statement Not Found")
      res.status(500).json({})
    }
  }
  )
  // https.createServer(app).listen(8081, function (){console.log('Servidor levantado com sucesso!')})
  app.listen(8081, function () { console.log('Servidor Online') })
}

init();