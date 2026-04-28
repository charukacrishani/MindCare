import unittest

from utils.auth import create_access_token, verify_token


class TestAuthUtils(unittest.TestCase):
    def test_create_and_verify_token(self) -> None:
        token = create_access_token({"user_id": "abc123"})

        user = verify_token(token)

        self.assertIsNotNone(user)
        self.assertEqual(user.user_id, "abc123")

    def test_verify_token_missing_user_id(self) -> None:
        token = create_access_token({"sub": "no-user-id"})

        user = verify_token(token)

        self.assertIsNone(user)

    def test_verify_token_invalid(self) -> None:
        user = verify_token("not-a-real-token")

        self.assertIsNone(user)


if __name__ == "__main__":
    unittest.main()
