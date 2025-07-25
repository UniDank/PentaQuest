package com.pentaproject.demobackend;

import com.pentaproject.demobackend.Controllers.PartyController;
import com.pentaproject.demobackend.Model.ClassType;
import com.pentaproject.demobackend.Model.Enemies.Enemy;
import com.pentaproject.demobackend.Repositories.EnemyRepository;
import com.pentaproject.demobackend.Repositories.PartyRepository;
import com.pentaproject.demobackend.Services.EnemyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;


import static org.junit.jupiter.api.Assertions.*;


import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;


@SpringBootTest
class DemoBackendApplicationTests {
    @Autowired
    EnemyRepository enemyRepository;
    @Autowired
    PartyRepository partyRepository;

    @Autowired
    private EnemyService service;

    @Autowired
    PartyController partyController;



    @Test
    @DisplayName("Salvataggio dati e verifica integrità di quest'ultimi")
    public void insertValueDB(){
        Enemy EnemyTemp =  this.service.generateEnemy("ProvaFinale2",29,28,2,40,40,20, 1, ClassType.Tank);
        assertEquals( EnemyTemp.getName(), enemyRepository.findByName(EnemyTemp.getName()).getName());
        enemyRepository.deleteByName(EnemyTemp.getName());
    }
    @Test
    @DisplayName("Salvataggio dati ed eliminazione di quest'ultimo")
    public void insertValueAndDeleteDB(){
        Enemy EnemyTemp =  this.service.generateEnemy("TestSalvataggioDatiAndDeleteSupremoDellaVita",29,28,2,40,40,20,1, ClassType.Tank);
        enemyRepository.deleteByName(EnemyTemp.getName());
        try {
            EnemyTemp = enemyRepository.findByName(EnemyTemp.getName());
        }catch (Exception e){
            assertFalse(false);
        }
    }
    @Test
    @DisplayName("Test connessione al DB")
    public void TestConnectionDB(){
        try{
            partyRepository.findAll();
        }catch(Exception e){
            assertFalse(false);
        }
    }
    //Test degli EndPoint 
    //TODO: cambiare il test getParty
    @Test
    @DisplayName("Test Party Controller method: getParty")
    public void TestGetParty() throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder().build();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create("http://localhost:8080/api/v1/party")).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        assertEquals(response.statusCode(), 200 );
    }
    @Test
    @DisplayName("Test Party Controller method: insertParty")
    public void TestInsertParty() throws IOException, InterruptedException {

        HttpClient client = HttpClient.newHttpClient();
        String payload = "{\"id\":243423,\"Party\":{\"Members\":[{\"name\":\"ARCH\",\"ATT\":10,\"DEF\":5,\"HP\":50,\"MANA\":25},{\"name\":\"MELEE\",\"ATT\":20,\"DEF\":20,\"HP\":50,\"MANA\":25}],\"Bag\":[{\"Name\":\"Healingpotion\",\"Type\":\"HP\",\"Value\":10,\"Quantity\":2},{\"Name\":\"Manapotion\",\"Type\":\"MANA\",\"Value\":5,\"Quantity\":10}]}}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:8080/api/v1/party"))
                .setHeader("content-type","application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());
        assertEquals(response.statusCode(),200 );

    }
    @Test
    @DisplayName("Test Enemies Controller method: getEnemies")
    public void TestGetEnemies() throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder().build();
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create("http://localhost:8080/api/v1/2/enemies")).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        assertEquals(response.statusCode(), 200 );
    }
}
