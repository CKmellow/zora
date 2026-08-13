class LoopIntegrationError(Exception):
    """Base LOOP integration error."""


class LoopAuthError(LoopIntegrationError):
    """Raised when LOOP auth fails."""


class LoopRequestError(LoopIntegrationError):
    """Raised when LOOP API request fails."""
