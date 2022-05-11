
const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');

const canvasCtx = canvasElement.getContext('2d');


let facemeshData = []
let FACEMESH_GLABELLA = [];

let RIGHT_EYE = []; 
let LEFT_EYE = [];

let FACEMESH_LANDMARKS = []

let MODEL_SCALE = null

let xPosition = undefined;
let yPosition = undefined;
let zPosition = undefined;  

let EYE_MIDPOINT = undefined

let PT_MATRIX = [];

const controls = window;
const drawingUtils = window;
const mpFaceDetection = window;
const mpFaceMesh = window;

const canvasAspectRatio = canvasElement.width / canvasElement.height;

// Face Detection
const onFaceDectectResults = async (results) => {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.detections.length > 0) { 
    drawingUtils.drawRectangle(canvasCtx, results.detections[0].boundingBox, { color: 'blue', lineWidth: 4, fillColor: '#00000000' });
    // drawingUtils.drawRectangle(canvasCtx, results.detections[0].boundingBox,{color: 'blue', lineWidth: 4, fillColor: '#00000000'});
    // drawingUtils.drawLandmarks(canvasCtx, results.detections[0].landmarks, {
    //   color: 'red',
    //   radius: 5,
    // });
  }
  canvasCtx.restore();
}

const faceDetection = new mpFaceDetection.FaceDetection({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
}});

faceDetection.setOptions({
  modelSelection: 0,
  minDetectionConfidence: 0.5
});

faceDetection.onResults(onFaceDectectResults);

// Facemesh 
const onResults = async (results) =>{
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, 	{color: '#C0C0C070', lineWidth: .2});
      moveData(landmarks)
      // drawBoundingBox(landmarks)
      // console.log(FACEMESH_RIGHT_EYE[0])
      // For the reference only
      drawPointGlabella(landmarks)
    }
    for (const facegeometry of results.multiFaceGeometry){
      facegeometryMoveData(facegeometry)
    }
  }
    canvasCtx.restore(results);
}

const faceMesh = new mpFaceMesh.FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});


faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.99,
  enableFaceGeometry: true
});

faceMesh.onResults(onResults);

const camera = new mpFaceMesh.Camera(videoElement, {
	onFrame: async () => {
		await faceMesh.send({ image: videoElement });
    // await faceDetection.send({ image: videoElement});
	},
	width: 640,
	height: 480
});


camera.start();

// =================================================================================

const facegeometryMoveData = (facegeometry) => {
  const pt_matrix = facegeometry.getPoseTransformMatrix().getPackedDataList();
  PT_MATRIX = []

  pt_matrix.forEach(item => {
    PT_MATRIX.push(item)
  })

}

const moveData = (landmarks) => {
  facemeshData = []
  landmarks.forEach(landmark => {
    facemeshData.push(landmark)
  });

  FACEMESH_LANDMARKS = []
  landmarks.forEach(landmark => {
    FACEMESH_LANDMARKS.push(landmark)
  });

  const glabellaPosition = [8]
  FACEMESH_GLABELLA = []
  glabellaPosition.forEach(index => {
    FACEMESH_GLABELLA.push(facemeshData[index])
  })


  const rightEyePosition = [359]
  RIGHT_EYE = []
  rightEyePosition.forEach(index => {
    RIGHT_EYE.push(facemeshData[index])
  })

  const leftEyePosition = [130]
  LEFT_EYE = []
  leftEyePosition.forEach(index => {
    LEFT_EYE.push(facemeshData[index])
  })
  calculateSkew(landmarks)
}

const calculateSkew = (landmarks) => {
  //use 0 for middle, 359 for top right, and 130 for top left.
    const leftEyeCorner = landmarks[130];
    const rightEyeCorner = landmarks[359];
    
    //midpoint between eye landmarks
    const eyeMidPoint = {
      x: (rightEyeCorner.x + leftEyeCorner.x) / 2,
      y: (rightEyeCorner.y + leftEyeCorner.y) / 2,
      z: (rightEyeCorner.z + leftEyeCorner.z) / 2
    };
    EYE_MIDPOINT = eyeMidPoint

    // Glasses position
    xPosition = FACEMESH_GLABELLA[0].x
    yPosition = FACEMESH_GLABELLA[0].y 
    zPosition = FACEMESH_GLABELLA[0].z


    // console.log(xPosition)
}


// Bounding Box
const calculateHeadDimention = (landmarks) => {
  const topHead = landmarks[10];
  const chin = landmarks[152];
  const leftFace = landmarks[134]
  const rightFace = landmarks[454]




  const faceHeight = Math.sqrt(
    (topHead.x + chin.x) ** 2 * 480 + 
    (topHead.y + chin.y) ** 2 * 480 +
    (topHead.z + chin.z) ** 2
  );

  const faceWidth = Math.sqrt(
    (leftFace.x + rightFace.x) ** 2 * canvasAspectRatio + 
    (leftFace.y + rightFace.y) ** 2 * canvasAspectRatio +
    (leftFace.z + rightFace.z) ** 2
  )

  const middleFace = Math.sqrt(
    (leftFace.y + rightFace.y) / 2 + 
    (leftFace.y + rightFace.y) / 2 + 
    (leftFace.z + rightFace.z) / 2
  )
  
  return {
    faceHeight,
    faceWidth,
    middleFace,
  }
}

const drawBoundingBox = (landmarks) => {
  const { faceWidth, faceHeight, middleFace } = calculateHeadDimention(landmarks)
  const canvasElem = document.getElementById("pointsCanvas")
  const context = canvasElem.getContext('2d')

  let xBoundingBoxPos = (xPosition * Math.sqrt(640)) + 140
  let yBoundingBoxPos = (yPosition * Math.sqrt(480)) + 225
  console.log(faceWidth)
  console.log(faceHeight)

  context.height = 480;
  context.width = 640;
  context.strokeStyle = "#8C2D29";
  context.fillStyle = "#000000";
  context.clearRect(0,0, context.width, context.height);
  context.beginPath();
  context.rect(xBoundingBoxPos, yBoundingBoxPos, 250, 170);
  // context.fill()
  context.stroke();

  context.beginPath();
  context.moveTo(320, 0);
  context.lineTo(320, 480);
  context.moveTo(640, 240);
  context.lineTo(0, 240);
  context.stroke();
}


const drawPointGlabella = async (landmarks) => {
	const canvasElem = document.getElementById("pointsCanvas")
  const context = canvasElem.getContext('2d')
  context.height = 480;
  context.width = 640;
	context.fillStyle = "red";
  context.clearRect(0,0, context.width, context.height);
	context.beginPath();
	context.arc(FACEMESH_GLABELLA[0].x * 640, FACEMESH_GLABELLA[0].y * 480, 3, 0, 2 * Math.PI);
	context.fill() 
}






