import unittest

from utils.dass21_level import get_dass21_level


class TestDass21Level(unittest.TestCase):
    def test_level_boundaries(self) -> None:
        self.assertEqual(get_dass21_level(0), "1")
        self.assertEqual(get_dass21_level(14), "1")
        self.assertEqual(get_dass21_level(15), "2")
        self.assertEqual(get_dass21_level(28), "2")
        self.assertEqual(get_dass21_level(29), "3")


if __name__ == "__main__":
    unittest.main()
