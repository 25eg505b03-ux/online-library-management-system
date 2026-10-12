package com.openshelf.library.book;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 220) private String title;
    @Column(nullable = false, length = 180) private String author;
    @Column(nullable = false, length = 100) private String category = "General";
    private Integer publicationYear;
    @Column(nullable = false) private Integer totalCopies = 1;
    @Column(nullable = false) private Integer availableCopies = 1;
    @Column(length = 3000) private String description;
    @Column(length = 1000) private String coverUrl;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; } public void setAuthor(String author) { this.author = author; }
    public String getCategory() { return category; } public void setCategory(String category) { this.category = category; }
    public Integer getPublicationYear() { return publicationYear; } public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }
    public Integer getTotalCopies() { return totalCopies; } public void setTotalCopies(Integer totalCopies) { this.totalCopies = totalCopies; }
    public Integer getAvailableCopies() { return availableCopies; } public void setAvailableCopies(Integer availableCopies) { this.availableCopies = availableCopies; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public String getCoverUrl() { return coverUrl; } public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}