import sys
import os
import unittest
import json
from unittest.mock import patch, MagicMock

# Ensure the parent directory is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app

class BasicTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def tearDown(self):
        pass

    def test_ping(self):
        response = self.client.get('/ping')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, b'pong')

    def test_add_comment(self):
        comment = {
            "commentId": 123,
            "user": "testuser@example.com",
            "text": "This is a test comment",
            "datePosted": "01/01/2024, 12:00",
            "deleted": False,
            "articleID": "1"
        }
        response = self.client.post('/addComment', data=json.dumps(comment), content_type='application/json')
        self.assertEqual(response.status_code, 200)

        self.assertIn("data added", response.get_data(as_text=True))
    
    @patch('app.requests.get')
    def test_get_articles(self, mock_get):
     
        mock_response = MagicMock()
        mock_response.json.return_value = {'response': {'docs': [{'headline': {'main': 'Test Article'}}]}}
        mock_response.ok = True
        mock_get.return_value = mock_response

        response = self.client.get('/getArticles')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('response', data)
        self.assertIn('docs', data['response'])
        self.assertEqual(data['response']['docs'][0]['headline']['main'], 'Test Article')


if __name__ == '__main__':
    unittest.main()