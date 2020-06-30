import string
import random

def gen_identifier():
    seed = "7LmMbKL32bYKnfdgsphr"
    return gen_str_from_seed(seed)


def gen_mxec():
    seed = "c3c37f1323dd478d95511bb8f1aecf25"
    return gen_str_from_seed(seed)


def gen_cfduid():
    seed = "d0606b48deb18cbcffccec0eda011e72d1593386502"
    return gen_str_from_seed(seed)


def gen_viewState():
    seed = "wEPDwUENTM4MQ9kFgJmD2QWAmYPZBYCZg9kFgJmD2QWBGYPZBYCAgIPZBYCZg9kFgJmDxYCHgRUZXh0Bc8DPHNjcmlwdD53aW5kb3cuZGF0YUxheWVyID0gd2luZG93LmRhdGFMYXllciB8fCBbXTsgd2luZG93LmRhdGFMYXllci5wdXNoKHsiY3VzdG9tZXJJZCIgOiAiMCIsICJsb2dnZWRJbiIgOiAiRmFsc2UiLCAicGFnZUNhdGVnb3J5IiA6ICJkZWZhdWx0IiwgInBhZ2VTdWJjYXRlZ29yeSIgOiAiIiwgInNlc3Npb25pZCIgOiAiMjkwNjIwMjAwMDE4MThfMTcyNjgxODkyMTRfMDAiLCAicGFnZVR5cGUiIDogImRlZmF1bHQiLCJiYXNrZXRQcm9kdWN0cyI6IHsiYmFza2V0U0tVcyIgOlsiOTc4MTg0MTQ5OTgzMyJdLCJiYXNrZXRNZWRpYVZhbHVlIiA6ICIwLjAwIiwgImJhc2tldFRlY2hWYWx1ZSIgOiAiMC4wMCIsICJiYXNrZXRUb3RhbFZhbHVlIiA6ICIwLjIxIiwgImJhc2tldE1lZGlhVW5pdHMiIDogIjAiLCAiYmFza2V0VG90YWxVbml0cyIgOiAiMSIsICJiYXNrZXRUZWNoVW5pdHMiIDogIjAiIH19KTwvc2NyaXB0PmQCARBkZBYEZg9kFgJmD2QWAgIGDxYCHgdWaXNpYmxlaGQCEA9kFgYCAg9kFgJmD2QWAgIIDxYCHwAFjQE8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+dmFyIHNiID0gbmV3IEVtcGF0aHlCcm9rZXJUQUcoJ2h0dHBzOi8vc2JtdXNpY21hZ3BpZS5lbXBhdGh5YnJva2VyLmNvbS9zYi1tdXNpY21hZ3BpZScsZmFsc2UpLmluaXQoKTs8L3NjcmlwdD5kAgMPZBYCZg9kFgYCAQ8QZBAVDg5TZWxlY3QgUHJvZHVjdBFBcHBsZSBBY2Nlc3Nvcmllcw5BcHBsZSBDb21wdXRlcgdBcHBsZVRWDkRpZ2l0YWwgQ2FtZXJhDUdhbWVzIENvbnNvbGUSR2FtaW5nIEFjY2Vzc29yaWVzBGlQb2QGS2luZGxlDU1vYmlsZSBwaG9uZXMOU21hcnQgU3BlYWtlcnMHVGFibGV0cw9WaXJ0dWFsIFJlYWxpdHkJV2VhcmFibGVzFQ4OU2VsZWN0IFByb2R1Y3QRQXBwbGUgQWNjZXNzb3JpZXMOQXBwbGUgQ29tcHV0ZXIHQXBwbGVUVg5EaWdpdGFsIENhbWVyYQ1HYW1lcyBDb25zb2xlEkdhbWluZyBBY2Nlc3NvcmllcwRpUG9kBktpbmRsZQ1Nb2JpbGUgcGhvbmVzDlNtYXJ0IFNwZWFrZXJzB1RhYmxldHMPVmlydHVhbCBSZWFsaXR5CVdlYXJhYmxlcxQrAw5nZ2dnZ2dnZ2dnZ2dnZxYBZmQCAw8QDxYCHgdFbmFibGVkaGQQFQEAFQEAFCsDAWcWAWZkAgUPEA8WAh8CaGQQFQEAFQEAFCsDAWcWAWZkAgQPZBYCZg9kFgJmD2QWBAIBDw8WAh8BaGRkAgMPD2QWAh4EdHlwZQUDdGVsZGQOnjGm3ATFCM7GCEpY1TTOSKnIdw"
    return gen_str_from_seed(seed)


def gen_music_magpie_tn():
    seed = "CA51C208079C0EE22E2C2C9B98EC89CF7D4FAE8520BECD8C950D38B87EB80CC4D68FFADEBF0A8F5BF68A0ED21131F85F9DD385B81647F6CAB43375E1DD93C7D43BA033AED458FEFF0BA58DE42F56784DE0AAA3D0236572093BFC3B95F909CAE4DF6D7CC76651EE1A722F6A45900C2C2140F603C4297F26B3ABBE81DB16696BB83ECDAE4DF6A50DA7C33DCCD13D317E0F5C35C8B35C8B5DD925674790A679A952D004459DFCF7C9CE8E01A8EE2A6DE0C0A6953838"
    return gen_str_from_seed(seed)


def gen_str_from_seed(seed):
    return_str = ""

    for i in range(len(seed)):
        curr_char = seed[i:i+1]
        if curr_char in string.ascii_lowercase:
            return_str += gen_lower_case()
        elif curr_char in string.ascii_uppercase:
            return_str += gen_upper_case()
        else:
            return_str += gen_number()
    return return_str


def gen_upper_case():
    letters = string.ascii_uppercase
    return random.choice(letters)


def gen_lower_case():
    letters = string.ascii_lowercase
    return random.choice(letters)


def gen_number():
    digits = string.digits
    return random.choice(digits)