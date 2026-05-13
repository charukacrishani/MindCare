import unittest
from utils.dass21_level import get_dass21_level

class TestDass21Level(unittest.TestCase):
    
    def test_depression_boundaries(self) -> None:
        # Level 1: 0-9
        self.assertEqual(get_dass21_level(0, "depression"), "1")
        self.assertEqual(get_dass21_level(9, "depression"), "1")
        # Level 2: 10-20
        self.assertEqual(get_dass21_level(10, "depression"), "2")
        self.assertEqual(get_dass21_level(20, "depression"), "2")
        # Level 3: 21+
        self.assertEqual(get_dass21_level(21, "depression"), "3")

    def test_anxiety_boundaries(self) -> None:
        # Level 1: 0-7
        self.assertEqual(get_dass21_level(7, "anxiety"), "1")
        # Level 2: 8-14
        self.assertEqual(get_dass21_level(8, "anxiety"), "2")
        self.assertEqual(get_dass21_level(14, "anxiety"), "2")
        # Level 3: 15+
        self.assertEqual(get_dass21_level(15, "anxiety"), "3")

    def test_stress_boundaries(self) -> None:
        # Level 1: 0-14
        self.assertEqual(get_dass21_level(14, "stress"), "1")
        # Level 2: 15-25
        self.assertEqual(get_dass21_level(15, "stress"), "2")
        self.assertEqual(get_dass21_level(25, "stress"), "2")
        # Level 3: 26+
        self.assertEqual(get_dass21_level(26, "stress"), "3")

if __name__ == "__main__":
    unittest.main()