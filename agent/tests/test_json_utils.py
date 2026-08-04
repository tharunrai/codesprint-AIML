"""Unit tests for core/json_utils.py."""

import pytest
from core.json_utils import extract_json, JSONExtractionError

def test_extract_json_clean():
    text = '{"key": "value"}'
    assert extract_json(text) == {"key": "value"}

def test_extract_json_with_fences():
    text = '```json\n{"key": "value"}\n```'
    assert extract_json(text) == {"key": "value"}

    text2 = '```\n{"key": "value"}\n```'
    assert extract_json(text2) == {"key": "value"}

def test_extract_json_with_prose():
    text = 'Here is the JSON you requested:\n```json\n{"key": "value"}\n```\nHope that helps!'
    assert extract_json(text) == {"key": "value"}

    text2 = 'Some text before\n{"key": "value"}\nSome text after'
    assert extract_json(text2) == {"key": "value"}

def test_extract_json_trailing_comma():
    text = '{"key": "value", "list": [1, 2, ],}'
    # trailing commas should be fixed
    assert extract_json(text) == {"key": "value", "list": [1, 2]}

def test_extract_json_invalid():
    with pytest.raises(JSONExtractionError):
        extract_json("This is just some text without any JSON object.")
        
    with pytest.raises(JSONExtractionError):
        extract_json("")
        
    with pytest.raises(JSONExtractionError):
        extract_json("[1, 2, 3]") # Expected dict, not list
