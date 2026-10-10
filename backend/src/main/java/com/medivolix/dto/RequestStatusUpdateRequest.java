package com.medivolix.dto;

public class RequestStatusUpdateRequest {
    private String status; // CONFIRMED, UNAVAILABLE, COMPLETED, CANCELLED
    private String notes;

    public RequestStatusUpdateRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
