from typing import Any, Optional
from fastapi import HTTPException
from fastapi.responses import JSONResponse, RedirectResponse, Response
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from starlette import status


class RedirectInfo(BaseModel):
    value: bool
    url: str


class ResponseHelper:
    @staticmethod
    def redirect_response(
        url: str,
        status_code: int = status.HTTP_302_FOUND,
        headers: Optional[dict] = None,
    ) -> RedirectResponse:
        """
        Real browser redirect response (302).
        """
        return RedirectResponse(url=url, status_code=status_code, headers=headers or {})

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status_code: int = status.HTTP_200_OK,
        meta: Optional[dict] = None,
        headers: Optional[dict] = None,
        redirect: Optional[RedirectInfo] = None,
        redirect_browser: bool = False,   # ✅ NEW
    ) -> Response:
        """
        Standard success response.
        If redirect_browser=True and redirect is provided, returns a real RedirectResponse.
        Otherwise returns JSONResponse (with redirect info in payload).
        """
        if redirect_browser and redirect is not None and redirect.value is True:
            return ResponseHelper.redirect_response(
                url=redirect.url,
                status_code=status.HTTP_302_FOUND,
                headers=headers,
            )

        payload = {
            "success": True,
            "message": message,
            "data": jsonable_encoder(data),
        }

        if meta is not None:
            payload["meta"] = jsonable_encoder(meta)

        if redirect is not None:
            payload["redirect"] = redirect.model_dump()

        return JSONResponse(status_code=status_code, content=payload, headers=headers or {})

    @staticmethod
    def error(
        message: str = "Something went wrong",
        errors: Optional[Any] = None,
        headers: Optional[dict] = None,
        redirect: Optional[RedirectInfo] = None,
        redirect_browser: bool = False,   # ✅ NEW
    ) -> Response:
        """
        Standard error response.
        If redirect_browser=True and redirect is provided, returns a real RedirectResponse.
        Otherwise returns JSONResponse (with redirect info in payload).
        """
        status_code = status.HTTP_400_BAD_REQUEST
        if redirect_browser and redirect is not None and redirect.value is True:
            return ResponseHelper.redirect_response(
                url=redirect.url,
                status_code=status.HTTP_302_FOUND,
                headers=headers,
            )

        payload = {
            "success": False,
            "message": message,
        }

        if errors is not None:
            payload["errors"] = jsonable_encoder(errors)

        if redirect is not None:
            payload["redirect"] = redirect.model_dump()

        return JSONResponse(status_code=status_code, content=payload, headers=headers or {})

    @staticmethod
    def raise_http_exception(
        message: str = "An error occurred",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        errors: Optional[Any] = None,
        headers: Optional[dict] = None,
        redirect: Optional[RedirectInfo] = None,
    ) -> None:
        """
        Raises FastAPI HTTPException with REST-style payload.
        (Can't do real browser redirect here because exceptions are JSON detail)
        """
        payload = {"success": False, "message": message}

        if errors is not None:
            payload["errors"] = jsonable_encoder(errors)

        if redirect is not None:
            payload["redirect"] = redirect.model_dump()

        raise HTTPException(status_code=status_code, detail=payload, headers=headers or {})
