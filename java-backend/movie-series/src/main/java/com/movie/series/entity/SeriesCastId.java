package com.movie.series.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class SeriesCastId implements Serializable {

    @Column(name = "series_id")
    private Long seriesId;

    @Column(name = "person_id")
    private Long personId;

    @Column(name = "cast_type")
    private String castType;
}
