<?php

it('shows the landing page', function () {
    $response = $this->get('/');

    $response->assertStatus(200);
});
