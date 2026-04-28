import unittest
from unittest.mock import patch

from utils import youtube_vids


class TestYoutubeVids(unittest.TestCase):
    def test_missing_api_key(self) -> None:
        with patch.object(youtube_vids, "API_KEY", None):
            with self.assertRaises(ValueError):
                youtube_vids.search_youtube("mindfulness")

    def test_search_youtube_parses_results(self) -> None:
        fake_response = {
            "items": [
                {
                    "id": {"videoId": "abc"},
                    "snippet": {
                        "title": "Title",
                        "channelTitle": "Channel",
                        "thumbnails": {"medium": {"url": "thumb"}},
                        "publishedAt": "2025-01-01",
                    },
                },
                {"id": {}, "snippet": {}},
            ]
        }

        with patch.object(youtube_vids, "API_KEY", "key"):
            with patch("utils.youtube_vids.requests.get") as mock_get:
                mock_get.return_value.json.return_value = fake_response
                mock_get.return_value.raise_for_status.return_value = None

                results = youtube_vids.search_youtube("query", max_results=2)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].url, "https://www.youtube.com/watch?v=abc")
        self.assertEqual(results[0].thumbnail, "thumb")
        self.assertEqual(results[0].channel, "Channel")


if __name__ == "__main__":
    unittest.main()
