import json
import unittest

from fastapi import HTTPException
from starlette import status

from utils.responses import RedirectInfo, ResponseHelper


class TestResponseHelper(unittest.TestCase):
    def test_success_json_response(self) -> None:
        response = ResponseHelper.success(
            data={"ok": True},
            message="All good",
            status_code=status.HTTP_201_CREATED,
            meta={"page": 1},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = json.loads(response.body.decode())
        self.assertTrue(payload["success"])
        self.assertEqual(payload["message"], "All good")
        self.assertEqual(payload["data"], {"ok": True})
        self.assertEqual(payload["meta"], {"page": 1})

    def test_success_redirect_response(self) -> None:
        redirect = RedirectInfo(value=True, url="https://example.com")

        response = ResponseHelper.success(
            redirect=redirect,
            redirect_browser=True,
        )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(response.headers.get("location"), "https://example.com")

    def test_error_json_response(self) -> None:
        response = ResponseHelper.error(message="Nope", errors={"field": "bad"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        payload = json.loads(response.body.decode())
        self.assertFalse(payload["success"])
        self.assertEqual(payload["message"], "Nope")
        self.assertEqual(payload["errors"], {"field": "bad"})

    def test_raise_http_exception_payload(self) -> None:
        with self.assertRaises(HTTPException) as context:
            ResponseHelper.raise_http_exception(
                message="Bad",
                status_code=status.HTTP_409_CONFLICT,
                errors={"detail": "invalid"},
            )

        exc = context.exception
        self.assertEqual(exc.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(
            exc.detail,
            {"success": False, "message": "Bad", "errors": {"detail": "invalid"}},
        )


if __name__ == "__main__":
    unittest.main()
