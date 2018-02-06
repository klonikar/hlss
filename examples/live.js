#!node

'use strict';

const { spawn } = require('child_process');
const fs = require("fs")
const hlss = require('hlss');

if(process.argv.length < 4) {
    console.log("Usage: " + process.argv[1] + " <cameraURL> <outputFolder>");
    process.exit(0)
}

// "rtsp://root:pass@192.168.10.49:554/axis-media/media.amp?resolution=640X480&fps=15"
const ffmpeg = spawn("ffmpeg", ['-re', '-i', process.argv[2],  '-an', '-c', 'copy', '-bsf', 'h264_mp4toannexb', '-f', 'mpegts', '-'], 
	                  {stdio: ['ignore', 'pipe', 'ignore']});
console.log("ffmpeg id:", ffmpeg.pid);

const segmenter = new hlss({
  outPath: process.argv[3],
  streamName: 'test',
  segDuration: 5,
  segNumber: 4,
  deleteFiles: true
});

segmenter.on('done', () => {
  console.log('all done!');
});

segmenter.start(ffmpeg.stdout);

if(ffmpeg.stderr) {
	ffmpeg.stderr.on('data', (data) => {
		console.log(`ffmpeg stderr: ${data}`);
	});
}

ffmpeg.on('close', (code) => {
    if(code != 0) {
    	console.log(`ffmpeg process exited (close) with code ${code}`);
    }
    process.exit(0);
});

ffmpeg.on('error', (code) => {
    if(code != 0) {
    	console.log(`ffmpeg process exited (error) with code ${code}`);
    }
    process.exit(0);
});

ffmpeg.on('exit', (code) => {
    if(code != 0) {
    	console.log(`ffmpeg process exited with code ${code}`);
    }
    process.exit(0);
});
