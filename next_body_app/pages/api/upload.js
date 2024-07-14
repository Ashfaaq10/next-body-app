import nextConnect from 'next-connect';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'uploads/' });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single('image'));

apiRoute.post((req, res) => {
  const imagePath = path.join(process.cwd(), req.file.path);

  // Call the Python script
  const pythonProcess = spawn('python', ['predict.py', imagePath]);

  pythonProcess.stdout.on('data', (data) => {
    res.status(200).json(JSON.parse(data));
    // Clean up uploaded file
    fs.unlinkSync(imagePath);
  });

  pythonProcess.stderr.on('data', (data) => {
    res.status(500).json({ error: data.toString() });
    // Clean up uploaded file
    fs.unlinkSync(imagePath);
  });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};
