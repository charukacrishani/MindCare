def get_dass21_level(score):
    max_score = 42
    step = max_score / 3

    if score <= step:
        return "1"
    elif score <= 2 * step:
        return "2"
    else:
        return "3"