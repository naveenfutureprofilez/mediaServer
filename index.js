require('dotenv').config();
const { default: axios } = require('axios');
const NodeMediaServer = require('node-media-server');

// node server configuration
const config = {
  logType: 0,
  rtmp: {
    port: 1935,
    chunk_size: 4096,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8080,
    allow_origin: '*'
  },
  auth: {
    api: parseInt(process.env.AUTH_API) === 1,
    api_user: process.env.API_USER,
    api_pass: process.env.API_PASS,
    play: parseInt(process.env.AUTH_PLAY) === 1,
    publish: parseInt(process.env.AUTH_PUBLISH) === 1,
    secret: process.env.AUTH_SECRET
  },
  // https: {
  //   port: 8043,
  //   key: "/etc/letsencrypt/live/live.tenniskhelo.com/privkey.pem",
  //   cert: "/etc/letsencrypt/live/live.tenniskhelo.com/fullchain.pem"
  // }
   
};

// console.log("config", config);
const apiObj = axios.create({
  baseURL : process.env.WEBHOOK_ENDPOINT,
  headers:{
    "Accept" : "application/json",
    "Authorization" : `Bearer ${process.env.WEBHOOK_API_KEY}`
  }
});

const handleEvent = async (stream, stream_event) => {
  await apiObj.post(`/handle/${stream}`, {stream_event})
  .then(resp => {
    console.log("webhook:", resp);
  }).catch(_err => {
    console.log("web-error", _err?.data || _err);
  })
} 


const nms = new NodeMediaServer(config);

// nms.on('preConnect', (id, args) => {
//   console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
// });

// nms.on('postConnect', (id, args) => {
//   console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
// });

// nms.on('doneConnect', (id, args) => {
//   console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
// });

// nms.on('prePublish', (id, StreamPath, args) => {
//   console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
//   // let session = nms.getSession(id);
// });

// Successfull Started Streaming
nms.on('postPublish', (id, StreamPath, args) => {
  // console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  const chunks = StreamPath.split("/");
  // console.log("Node Live", `${chunks}`);
  if(chunks[2] !== undefined && chunks[2] !== null){
    handleEvent(chunks[2], "live");
  }
});

// Streaming Stopped Manually
nms.on('donePublish', (id, StreamPath, args) => {
  // console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  const chunks = StreamPath.split("/");
  // console.log("Node Live", `${chunks}`);
  if(chunks[2] !== undefined && chunks[2] !== null){
    handleEvent(chunks[2], "offline");
  }
});

// nms.on('prePlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
//   // let session = nms.getSession(id);
//   // session.reject();
// });

// nms.on('postPlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
// });

// nms.on('donePlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
// });

nms.run();
 