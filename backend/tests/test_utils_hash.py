import unittest

from utils.hash import hash_password, verify_password


class TestHashUtils(unittest.TestCase):
    def test_hash_and_verify_password(self) -> None:
        password = "S3cret!"

        hashed = hash_password(password)

        self.assertNotEqual(password, hashed)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("wrong", hashed))


if __name__ == "__main__":
    unittest.main()
