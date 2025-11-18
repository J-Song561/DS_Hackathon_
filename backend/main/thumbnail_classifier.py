import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import requests
from io import BytesIO
import pickle
import os
from django.conf import settings

class ThumbnailEncoder:
    def __init__(self, model_name='mobilenet_v2'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        self.model = models.mobilenet_v2(pretrained=True)
        self.model.classifier = torch.nn.Identity()
        self.model = self.model.to(self.device)
        self.model.eval()
        
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                               std=[0.229, 0.224, 0.225])
        ])
    
    def encode_from_url(self, url):
        try:
            response = requests.get(url, timeout=10)
            img = Image.open(BytesIO(response.content)).convert('RGB')
            img_tensor = self.preprocess(img).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                embedding = self.model(img_tensor)
            
            return embedding.cpu().numpy().flatten()
        except Exception as e:
            print(f"Error encoding thumbnail: {e}")
            return None

class ThumbnailClassifier:
    def __init__(self, model_path):
        self.encoder = ThumbnailEncoder()
        
        with open(model_path, 'rb') as f:
            self.knn = pickle.load(f)
    
    def predict(self, thumbnail_url):
        """
        Returns 1 if harmful, 0 if safe (for your scoring)
        """
        embedding = self.encoder.encode_from_url(thumbnail_url)
        
        if embedding is None:
            return 0  # Default to safe if can't analyze
        
        embedding = embedding.reshape(1, -1)
        prediction = self.knn.predict(embedding)[0]
        probabilities = self.knn.predict_proba(embedding)[0]
        
        return {
            'score': int(prediction),  # 0 or 1 for your formula
            'confidence': float(probabilities[prediction]),
            'probabilities': {
                'safe': float(probabilities[0]),
                'harmful': float(probabilities[1])
            }
        }

# Initialize once when Django starts
MODEL_PATH = os.path.join(settings.BASE_DIR, 'ml_models', 'models', 'watchwise_thumbnail_classifier.pkl')
thumbnail_classifier = ThumbnailClassifier(MODEL_PATH)