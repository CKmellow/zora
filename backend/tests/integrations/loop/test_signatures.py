from app.integrations.loop.signatures import sign


def test_loop_signature_known_fixture() -> None:
    secret = "hyqd7bwMr9Kv-C5PW4n7uF4TiMnMp_hyvyhYYkYlcU8"
    till_value = "133239"
    timestamp = "2026-07-21T07:37:56Z"
    nonce = "3a4c1f3d-5b00-478f-bd18-4ccf6fae895a"
    expected = "557dc74f9e53ec51b1c48aeaebe60bc89e108b753d7874336286c333a3692c5c"

    assert sign(till_value=till_value, timestamp=timestamp, nonce=nonce, secret=secret) == expected
