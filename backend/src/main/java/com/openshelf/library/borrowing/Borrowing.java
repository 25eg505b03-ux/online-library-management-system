package com.openshelf.library.borrowing;

import com.openshelf.library.auth.AppUser;
import com.openshelf.library.book.Book;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrowings")
public class Borrowing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) private AppUser member;
    @ManyToOne(optional = false, fetch = FetchType.EAGER) private Book book;
    @Column(nullable = false) private LocalDate borrowDate = LocalDate.now();
    @Column(nullable = false) private LocalDate dueDate = LocalDate.now().plusDays(14);
    private LocalDate returnDate;
    @Column(nullable = false, length = 20) private String status = "BORROWED";
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public AppUser getMember() { return member; } public void setMember(AppUser member) { this.member = member; }
    public Book getBook() { return book; } public void setBook(Book book) { this.book = book; }
    public LocalDate getBorrowDate() { return borrowDate; } public void setBorrowDate(LocalDate borrowDate) { this.borrowDate = borrowDate; }
    public LocalDate getDueDate() { return dueDate; } public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getReturnDate() { return returnDate; } public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
}