package com.movie.series.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "series_cast")
public class SeriesCast {

    @EmbeddedId
    private SeriesCastId id;

    @Column(length = 100)
    private String role;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;
}
