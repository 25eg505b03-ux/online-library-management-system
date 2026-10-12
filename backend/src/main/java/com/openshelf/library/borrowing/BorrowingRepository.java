package com.openshelf.library.borrowing;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {
    List<Borrowing> findByMemberIdOrderByBorrowDateDesc(Long memberId);
    boolean existsByMemberIdAndBookIdAndStatus(Long memberId, Long bookId, String status);
}