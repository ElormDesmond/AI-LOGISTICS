from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.services.audit_pdf import audit_pdf_service
from app.security.jwt_handler import get_current_user

router = APIRouter(prefix="/audit", tags=["Regulatory Compliance Audit PDF Exporter"])

@router.get("/compliance-binder")
def get_compliance_binder_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Compile and retrieve official FDA 21 CFR Part 11 & EU GDP annual compliance audit binder.
    """
    return audit_pdf_service.generate_annual_compliance_binder(company_id=current_user["company_id"])

@router.get("/export-pdf")
def export_pdf_audit_report_endpoint(current_user: dict = Depends(get_current_user)):
    """
    Export downloadable FDA regulatory compliance audit binder payload.
    """
    return audit_pdf_service.generate_annual_compliance_binder(company_id=current_user["company_id"])
