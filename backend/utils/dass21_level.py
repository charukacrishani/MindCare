def get_dass21_level(score, category):
    """
    Maps doubled DASS-21 scores to three custom levels.
    Level 1: Normal
    Level 2: Mild/Moderate
    Level 3: Severe/Extremely Severe
    """
    category = category.lower()
    
    if category == 'depression':
        if score <= 9: return "1"
        if score <= 20: return "2"
        return "3"
        
    elif category == 'anxiety':
        if score <= 7: return "1"
        if score <= 14: return "2"
        return "3"
        
    elif category == 'stress':
        if score <= 14: return "1"
        if score <= 25: return "2"
        return "3"
    
    return None