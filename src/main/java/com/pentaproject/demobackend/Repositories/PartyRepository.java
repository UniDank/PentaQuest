package com.pentaproject.demobackend.Repositories;

import com.pentaproject.demobackend.Model.Party.Party;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PartyRepository extends MongoRepository<Party, Integer> {

}
